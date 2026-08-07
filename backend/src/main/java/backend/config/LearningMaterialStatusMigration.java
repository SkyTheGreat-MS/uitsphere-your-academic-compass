package backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class LearningMaterialStatusMigration {

    private final JdbcTemplate jdbcTemplate;

    public LearningMaterialStatusMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    void migrateStatusConstraint() {
        Boolean tableExists = jdbcTemplate.queryForObject(
                "SELECT to_regclass('public.learning_materials') IS NOT NULL",
                Boolean.class);
        if (!Boolean.TRUE.equals(tableExists)) {
            return;
        }

        jdbcTemplate.execute("""
                ALTER TABLE learning_materials
                    DROP CONSTRAINT IF EXISTS learning_materials_status_check
                """);

        jdbcTemplate.update("""
                UPDATE learning_materials
                SET status = 'READY'
                WHERE status = 'COMPLETED'
                """);

        jdbcTemplate.execute("""
                ALTER TABLE learning_materials
                    ADD CONSTRAINT learning_materials_status_check
                    CHECK (status IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED'))
                """);
    }
}
