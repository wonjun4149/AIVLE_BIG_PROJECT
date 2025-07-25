package self.controller;

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import self.service.FirebaseAuthService;
import com.google.firebase.auth.UserRecord;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final FirebaseAuthService firebaseAuthService;

    public AuthController(FirebaseAuthService firebaseAuthService) {
        this.firebaseAuthService = firebaseAuthService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {
        try {
            UserRecord user = firebaseAuthService.createUser(request.getEmail(), request.getPassword(), request.getName());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("회원가입 실패: " + e.getMessage());
        }
    }

    @Data
    public static class SignUpRequest {
        private String email;
        private String password;
        private String name;
    }
}
