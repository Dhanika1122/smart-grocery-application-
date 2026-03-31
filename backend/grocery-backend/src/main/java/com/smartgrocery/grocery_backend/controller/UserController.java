package com.smartgrocery.grocery_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.User;
import com.smartgrocery.grocery_backend.repository.UserRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

@Autowired
private UserRepository userRepository;

@GetMapping
public List<User> getAllUsers(){

return userRepository.findAll();

}

}