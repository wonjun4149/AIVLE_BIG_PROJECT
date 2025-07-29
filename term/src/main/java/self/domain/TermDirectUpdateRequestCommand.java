package self.domain;

import lombok.Data;

@Data
public class TermDirectUpdateRequestCommand {
    private String title;
    private String content;
    private String memo;
}
