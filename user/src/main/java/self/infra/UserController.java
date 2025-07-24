package self.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import self.domain.*;

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/users")
@Transactional
public class UserController {

    @Autowired
    UserRepository userRepository;

    @RequestMapping(
        value = "/users/userlogin",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public User userLogin(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody UserLoginCommand userLoginCommand
    ) throws Exception {
        System.out.println("##### /user/userLogin  called #####");
        User user = new User();
        user.userLogin(userLoginCommand);
        userRepository.save(user);
        return user;
    }
}
//>>> Clean Arch / Inbound Adaptor
