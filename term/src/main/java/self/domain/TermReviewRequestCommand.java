package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;

@Data
public class TermReviewRequestCommand {

    private Long id;
    private String userId;
    private String title;
    private String category;
    private String productName;
    private String content;
    private String requirement;
    private String version;
    private String memo;
    private String origin;
    private Date createdAt;
    private Date modifiedAt;
    private Date expiresAt;
    private String risk;
    private String feedback;
    private String client;
    private String userCompany;
    private String langCode;
}
