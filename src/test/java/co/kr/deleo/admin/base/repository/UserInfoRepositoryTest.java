package co.kr.deleo.admin.base.repository;


import co.kr.deleo.admin.base.Constant;
import co.kr.deleo.admin.base.dto.UserInfo;
import co.kr.deleo.admin.base.util.DocUtil;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.test.context.junit4.SpringRunner;

import javax.transaction.Transactional;
import java.io.UnsupportedEncodingException;
import java.security.GeneralSecurityException;

@RunWith(SpringRunner.class)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
public class UserInfoRepositoryTest {

    @Autowired
    private UserInfoRepository userInfoRepository;

    @Test
//    @Rollback(false)
    public void userInfo_add_test() throws GeneralSecurityException, UnsupportedEncodingException {
        UserInfo userInfo = new UserInfo();
        userInfo.setUserId("admin");
        userInfo.setUserNm("Administrator user");
        userInfo.setUserPw(makePassword("1234"));
        userInfo.setAuthCd(Constant.ADMIN.name());
        userInfo.setCreator("admin");
        userInfo.setModifier("admin");
        userInfo.setEmail(DocUtil.encrypt("dhseong@deleo.co.kr"));
        userInfo.setOtpYn("N");
        userInfo.setUseYn("Y");
        userInfo.setTelNo(DocUtil.encrypt("01052752028"));

        UserInfo save = userInfoRepository.save(userInfo);

        Assert.assertEquals(userInfo.getUserId(), save.getUserId());

    }

    public static String makePassword(String password) {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder().encode(password);
    }



}