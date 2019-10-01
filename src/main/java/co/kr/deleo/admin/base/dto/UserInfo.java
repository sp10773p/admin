package co.kr.deleo.admin.base.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.security.auth.Subject;
import java.io.Serializable;
import java.security.Principal;
import java.util.Date;


@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@Entity(name = "ts_user")
public class UserInfo implements Principal, Serializable {
    private static final long serialVersionUID = 8433999509932007961L;

    @Id @Column(name = "user_id")
    private String userId;

    @Column(name = "user_nm")
    private String userNm;

    @JsonIgnore
    @Column(name = "user_pw")
    private String userPw;

    private String email;

    @Column(name = "tel_no")
    private String telNo;

    @Column(name = "auth_cd")
    private String authCd;

    @Column(name = "use_yn")
    @Builder.Default
    private String useYn = "Y";

    @Column(name = "otp_yn")
    @Builder.Default
    private String otpYn = "N";

    @Column(name = "otp_no")
    private String otpNo;

    @Column(name = "login_fail_cnt")
    @Builder.Default
    private Integer loginFailCnt = 0;

    private String creator;
    private String modifier;

    @Temporal(TemporalType.TIMESTAMP)
    @Builder.Default
    private Date created = new Date();

    @Temporal(TemporalType.TIMESTAMP)
    @Builder.Default
    private Date modified = new Date();

    @Override
    public String getName() {
        return userNm;
    }

    @Override
    public boolean implies(Subject subject) {
        return false;
    }


    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((userId == null) ? 0 : userId.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;

        UserInfo other = (UserInfo) obj;
        if (userId == null) {
            if (other.userId != null)
                return false;
        } else if (!userId.equals(other.userId))
            return false;
        return true;
    }
}
