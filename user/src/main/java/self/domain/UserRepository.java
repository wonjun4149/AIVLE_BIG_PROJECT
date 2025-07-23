package self.domain;

import java.util.Date;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import self.domain.*;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "users", path = "users")
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
    @Query(
        value = "select user " +
        "from User user " +
        "where(:id is null or user.id = :id) and (:name is null or user.name like %:name%) and (:email is null or user.email = :email) and (:password is null or user.password like %:password%) and (:company is null or user.company like %:company%)"
    )
    User getUserInfo(
        Long id,
        String name,
        Email email,
        String password,
        String company
    );
}
