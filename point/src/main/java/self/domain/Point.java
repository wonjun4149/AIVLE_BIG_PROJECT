package self.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import self.PointApplication;
import self.domain.PointPurchased;
import self.domain.PointReduced;

@Entity
@Table(name = "Point_table")
@Data
//<<< DDD / Aggregate Root
public class Point {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Integer amount;

    private Long userId;

    @PostPersist
    public void onPostPersist() {
        PointPurchased pointPurchased = new PointPurchased(this);
        pointPurchased.publishAfterCommit();

        PointReduced pointReduced = new PointReduced(this);
        pointReduced.publishAfterCommit();
    }

    public static PointRepository repository() {
        PointRepository pointRepository = PointApplication.applicationContext.getBean(
            PointRepository.class
        );
        return pointRepository;
    }

    //<<< Clean Arch / Port Method
    public static void reducePoint(TermCreateRequested termCreateRequested) {
        //implement business logic here:

        /** Example 1:  new item 
        Point point = new Point();
        repository().save(point);

        PointReduced pointReduced = new PointReduced(point);
        pointReduced.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(termCreateRequested.get???()).ifPresent(point->{
            
            point // do something
            repository().save(point);

            PointReduced pointReduced = new PointReduced(point);
            pointReduced.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void reducePoint(
        ForeignTermCreateRequested foreignTermCreateRequested
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Point point = new Point();
        repository().save(point);

        PointReduced pointReduced = new PointReduced(point);
        pointReduced.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(foreignTermCreateRequested.get???()).ifPresent(point->{
            
            point // do something
            repository().save(point);

            PointReduced pointReduced = new PointReduced(point);
            pointReduced.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void reducePoint(RiskDetectRequested riskDetectRequested) {
        //implement business logic here:

        /** Example 1:  new item 
        Point point = new Point();
        repository().save(point);

        PointReduced pointReduced = new PointReduced(point);
        pointReduced.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(riskDetectRequested.get???()).ifPresent(point->{
            
            point // do something
            repository().save(point);

            PointReduced pointReduced = new PointReduced(point);
            pointReduced.publishAfterCommit();

         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void reducePoint(
        AiTermModifyRequested aiTermModifyRequested
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Point point = new Point();
        repository().save(point);

        PointReduced pointReduced = new PointReduced(point);
        pointReduced.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(aiTermModifyRequested.get???()).ifPresent(point->{
            
            point // do something
            repository().save(point);

            PointReduced pointReduced = new PointReduced(point);
            pointReduced.publishAfterCommit();

         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
