package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;

@Data
public class ForeinTermCreateRequestCommand {

    private Long id;
    private Long userId;
    private String title;
    private String category;
    private String productName;
    private String content;
    private String version;
    private String memo;
    private String origin;
    private Date createdAt;
    private Date modifiedAt;
    private Date expiresAt;
    private String feedback;
    private String client;
    private String userCompany;
    private String langCode;
}
