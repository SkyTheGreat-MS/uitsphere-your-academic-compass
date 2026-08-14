package backend.dto;

public class StudentDTO {

    private String universityId;

    private String name;

    private String email;

    private String batch;

    private String department;

    private Integer year;
    private String section;
    private String bio;
    private String avatarInitials;
    private String avatarUrl;


    public StudentDTO() {
    }


    public String getUniversityId() {
        return universityId;
    }


    public void setUniversityId(String universityId) {
        this.universityId = universityId;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public String getBatch() {
        return batch;
    }


    public void setBatch(String batch) {
        this.batch = batch;
    }


    public String getDepartment() {
        return department;
    }


    public void setDepartment(String department) {
        this.department = department;
    }


    public Integer getYear() {
        return year;
    }


    public void setYear(Integer year) {
        this.year = year;
    }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatarInitials() { return avatarInitials; }
    public void setAvatarInitials(String avatarInitials) { this.avatarInitials = avatarInitials; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
