package co.kr.deleo.admin.security;

import co.kr.deleo.admin.base.dto.UserInfo;
import co.kr.deleo.admin.base.exception.LoginLockException;
import co.kr.deleo.admin.base.repository.UserInfoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DeleoUserDetailService implements UserDetailsService {
    private final Logger logger = LoggerFactory.getLogger(DeleoUserDetailService.class);

    @Autowired
    private UserInfoRepository userInfoRepository;

    @Value("${security.access.login-fail-cnt}")
    int limitLoginFailCnt;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        Optional<UserInfo> userInfo = userInfoRepository.findByUserId(userId);

        // todo auth group checking
        if (userInfo.isEmpty()) {
            throw new UsernameNotFoundException("Invalid username/password.");
        }

        int cnt = userInfo.get().getLoginFailCnt();
        logger.debug("Login fail count check : fail count - {}, limit login fail count - {}", cnt, limitLoginFailCnt);
        if (cnt > limitLoginFailCnt) {
            throw new LoginLockException("Login lock");
        }

        // todo menu, access ip checking
//        deleoUser.setMenuList(commonDAO.list("common.selectMenuList", deleoUser.getUserId()));
//        deleoUser.setIp(commonDAO.list("common.selectUserIpAccess", deleoUser.getUserId()));

        DeleoUserDetails deleoUserDetails = new DeleoUserDetails();
        deleoUserDetails.setUserInfo(userInfo.get());

        return deleoUserDetails;
    }
}
