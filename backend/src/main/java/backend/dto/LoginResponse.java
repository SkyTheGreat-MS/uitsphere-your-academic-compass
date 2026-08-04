package backend.dto;

public class LoginResponse {

    private boolean success;
    private String message;
    private StudentDTO student;
    private String token;

    public LoginResponse() {
    }

    public LoginResponse(boolean success, String message,String token, StudentDTO student) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.student = student;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public String getToken(){
        return token;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public StudentDTO getStudent() {
        return student;
    }

    public void setStudent(StudentDTO student) {
        this.student = student;
    }
}