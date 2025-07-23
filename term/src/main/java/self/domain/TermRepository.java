package self.domain;

import java.util.Date;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import self.domain.*;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "terms", path = "terms")
public interface TermRepository extends PagingAndSortingRepository<Term, Long> {
    @Query(
        value = "select term " +
        "from Term term " +
        "where(:id is null or term.id = :id) and (:userId is null or term.userId = :userId) and (:point is null or term.point = :point) and (:contractId is null or term.contractId = :contractId)"
    )
    List<Term> getTerm(
        Long id,
        Long userId,
        Integer point,
        Long contractId,
        Pageable pageable
    );
}
