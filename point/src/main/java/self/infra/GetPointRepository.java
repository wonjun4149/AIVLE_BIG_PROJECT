package self.infra;

import java.util.List;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import self.domain.*;

@RepositoryRestResource(collectionResourceRel = "getPoints", path = "getPoints")
public interface GetPointRepository
    extends PagingAndSortingRepository<GetPoint, Long> {}
