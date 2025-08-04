package self.qna.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.secret-id}")
    private String secretId;

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.storage-bucket}")
    private String storageBucket;

    @PostConstruct
    public void initFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            try (SecretManagerServiceClient client = SecretManagerServiceClient.create()) {
                SecretVersionName secretVersionName = SecretVersionName.of(projectId, secretId, "latest");
                String secretPayload = client.accessSecretVersion(secretVersionName).getPayload().getData().toStringUtf8();
                InputStream serviceAccount = new ByteArrayInputStream(secretPayload.getBytes(StandardCharsets.UTF_8));

                FirebaseOptions options = new FirebaseOptions.Builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setProjectId(projectId)
                        .setStorageBucket(storageBucket)
                        .build();

                FirebaseApp.initializeApp(options);
            }
        }
    }
}
