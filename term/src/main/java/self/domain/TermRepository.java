package self.domain;

import java.util.Date;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import self.domain.*;

//<<< PoEAA / Repository
public interface TermRepository extends PagingAndSortingRepository<Term, Long> {
    @Query(
        value = "select term " +
        "from Term term " +
        "where(:id is null or term.id = :id) and (:userId is null or term.userId = :userId)"
    )
    List<Term> getTerm(Long id, String userId, Pageable pageable);
}
