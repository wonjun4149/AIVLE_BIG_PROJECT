package self.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import org.springframework.stereotype.Service;

@Service
public class FirebaseAuthService {

    public UserRecord createUser(String email, String password, String displayName) throws Exception {
        CreateRequest request = new CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName);

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
        return userRecord;
    }
}
