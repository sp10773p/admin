package co.kr.deleo.admin.base.repository;

import co.kr.deleo.admin.base.dto.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    Optional<UserInfo> findByUserId(String userId);
}
