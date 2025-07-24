package self.domain;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import self.domain.*;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "ais", path = "ais")
public interface AiRepository extends PagingAndSortingRepository<Ai, Long> {}
