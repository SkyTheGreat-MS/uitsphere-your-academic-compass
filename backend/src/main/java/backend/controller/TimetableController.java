package backend.controller;

import backend.dto.TimetableResponse;
import backend.service.TimetableService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/timetable")
public class TimetableController {
    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) { this.timetableService = timetableService; }

    @GetMapping
    public List<TimetableResponse> getTimetable() { return timetableService.getForCurrentStudent(); }
}
