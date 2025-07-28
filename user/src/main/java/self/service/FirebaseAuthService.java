package self.service;

import com.google.firebase.auth.ActionCodeSettings;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.UserRecord.UpdateRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FirebaseAuthService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthService.class);
    private final FirebaseAuth firebaseAuth;
    private final EmailService emailService;

    @Value("${firebase.email-verification-url}")
    private String emailVerificationUrl;

    public UserRecord createUser(String email, String password, String displayName) throws Exception {
        CreateRequest request = new CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName)
                .setEmailVerified(false);

        logger.info("Creating user with email: {}", email);
        UserRecord userRecord = firebaseAuth.createUser(request);
        logger.info("User created with email: {}", email);

        // ActionCodeSettings for email verification
        ActionCodeSettings actionCodeSettings = ActionCodeSettings.builder()
                .setUrl(emailVerificationUrl + "?token=" + userRecord.getUid()) // Pass user UID as a token
                .setHandleCodeInApp(true)
                .build();

        String link = firebaseAuth.generateEmailVerificationLink(email, actionCodeSettings);
        
        // Send the verification link via email
        String subject = "회원가입을 축하합니다! 이메일 인증을 완료해주세요.";
        String body = "안녕하세요! 저희 웹사이트에 가입해주셔서 감사합니다.\n\n"
                    + "계정을 활성화하려면 아래 링크를 클릭해주세요:\n" + link;

        emailService.sendSimpleMessage(email, subject, body);
        logger.info("Sent email verification link to {}", email);

        return userRecord;
    }

}
