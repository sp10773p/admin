package co.kr.deleo.admin.security;

import co.kr.deleo.admin.base.dto.UserInfo;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class DeleoUserDetails implements UserDetails {
    private static final long serialVersionUID = 3384436451564509032L;

    private UserInfo userInfo;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
        grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + userInfo.getAuthCd()));
        return grantedAuthorities;
    }

    @Override
    public String getPassword() {
        return userInfo.getUserPw();
    }

    @Override
    public String getUsername() {
        return userInfo.getUserId();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public void setUserInfo(UserInfo userInfo) {
        this.userInfo = userInfo;
    }

    public UserInfo getUserInfo() {
        return userInfo;
    }
}
