package com.academy.business.service;

import com.academy.persistence.entity.StudentEntity;
import com.academy.persistence.repository.StudentJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentJpaRepository students;

    @Transactional(readOnly = true)
    public List<StudentEntity> findAll() {
        return students.findAll();
    }

    @Transactional
    public Optional<StudentEntity> create(StudentEntity student) {
        if (students.existsByEmailIgnoreCase(student.getEmail())) {
            return Optional.empty();
        }
        return Optional.of(students.save(student));
    }
}
