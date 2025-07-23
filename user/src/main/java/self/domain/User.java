package self.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import self.UserApplication;
import self.domain.InfoModified;
import self.domain.UserLoggedIn;
import self.domain.UserSignedUp;

@Entity
@Table(name = "User_table")
@Data
//<<< DDD / Aggregate Root
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    private Email email;

    private String password;

    private String company;

    @PostPersist
    public void onPostPersist() {
        UserSignedUp userSignedUp = new UserSignedUp(this);
        userSignedUp.publishAfterCommit();

        UserLoggedIn userLoggedIn = new UserLoggedIn(this);
        userLoggedIn.publishAfterCommit();
    }

    @PostUpdate
    public void onPostUpdate() {
        InfoModified infoModified = new InfoModified(this);
        infoModified.publishAfterCommit();
    }

    public static UserRepository repository() {
        UserRepository userRepository = UserApplication.applicationContext.getBean(
            UserRepository.class
        );
        return userRepository;
    }
}
//>>> DDD / Aggregate Root
