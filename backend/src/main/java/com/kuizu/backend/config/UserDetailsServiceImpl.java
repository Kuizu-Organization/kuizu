package com.kuizu.backend.config;

import com.kuizu.backend.entity.User;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                User user = userRepository.findByUsername(username)
                                .orElseGet(() -> userRepository.findByEmail(username)
                                                .orElseThrow(() -> new UsernameNotFoundException(
                                                                "User not found with username or email: " + username)));

                boolean enabled = user.getStatus() == User.UserStatus.ACTIVE;
                boolean accountNonLocked = user.getStatus() != User.UserStatus.SUSPENDED;

                return new org.springframework.security.core.userdetails.User(
                                user.getUsername(),
                                user.getPasswordHash(),
                                enabled,
                                true, // accountNonExpired
                                true, // credentialsNonExpired
                                accountNonLocked,
                                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())));
        }
}
