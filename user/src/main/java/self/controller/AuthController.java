package self.controller;

import com.google.firebase.auth.FirebaseAuthException;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import self.service.FirebaseAuthService;

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
            firebaseAuthService.createUser(request.getEmail(), request.getPassword(), request.getName());
            return ResponseEntity.ok("회원가입 성공. 이메일을 확인하여 인증을 완료해주세요.");
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
