package self.config;

import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class FirebaseAuthentication extends AbstractAuthenticationToken {

    private final String uid;
    private final FirebaseToken firebaseToken;

    public FirebaseAuthentication(String uid, FirebaseToken firebaseToken, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.uid = uid;
        this.firebaseToken = firebaseToken;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return firebaseToken;
    }

    @Override
    public Object getPrincipal() {
        return uid;
    }
}
