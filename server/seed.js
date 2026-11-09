import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './configs/mongodb.js';
import User from './models/User.js';
import Course from './models/Course.js';

const dummyEducator = {
    _id: "675ac1512100b91a6d9b8b24",
    name: "GreatStack",
    email: "user.greatstack@gmail.com",
    imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yclFkaDBOMmFqWnBoTTRBOXZUanZxVlo0aXYifQ",
    enrolledCourses: []
};

const dummyCourses = [
    {
        "_id": "605c72efb3f1c2b1f8e4e1a1",
        "courseTitle": "Introduction to JavaScript",
        "courseDescription": "<h2>Learn the Basics of JavaScript</h2><p>JavaScript is a versatile programming language that powers the web. In this course, you will learn the fundamentals of JavaScript, including syntax, data types, and control structures.</p><p>This course is perfect for beginners who want to start their journey in web development. By the end of this course, you will be able to create interactive web pages and understand the core concepts of JavaScript.</p><ul><li>Understand the basics of programming</li><li>Learn how to manipulate the DOM</li><li>Create dynamic web applications</li></ul>",
        "coursePrice": 49.99,
        "isPublished": true,
        "discount": 20,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Getting Started with JavaScript",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "What is JavaScript?",
                        "lectureDuration": 16,
                        "lectureUrl": "https://youtu.be/CBWnBi-awSA",
                        "isPreviewFree": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Setting Up Your Environment",
                        "lectureDuration": 19,
                        "lectureUrl": "https://youtu.be/4l87c2aeB4I",
                        "isPreviewFree": false,
                        "lectureOrder": 2
                    }
                ]
            },
            {
                "chapterId": "chapter2",
                "chapterOrder": 2,
                "chapterTitle": "Variables and Data Types",
                "chapterContent": [
                    {
                        "lectureId": "lecture3",
                        "lectureTitle": "Understanding Variables",
                        "lectureDuration": 18,
                        "lectureUrl": "https://youtu.be/pZQeBJe6da0",
                        "isPreviewFree": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture4",
                        "lectureTitle": "Data Types in JavaScript",
                        "lectureDuration": 24,
                        "lectureUrl": "https://youtu.be/nCzmtFnZ4c8",
                        "isPreviewFree": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [],
        "courseRatings": [
            {
                "userId": "user_1",
                "rating": 5
            },
            {
                "userId": "user_2",
                "rating": 4
            }
        ],
        "courseThumbnail": "https://img.youtube.com/vi/CBWnBi-awSA/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1a2",
        "courseTitle": "Advanced Python Programming",
        "courseDescription": "<h2>Deep Dive into Python</h2><p>Python is known for its simplicity and readability. In this course, you will explore advanced topics such as decorators, generators, and context managers.</p><p>This course is designed for intermediate developers looking to master Python.</p><ul><li>Master advanced object-oriented programming</li><li>Work with asynchronous Python</li><li>Write clean and maintainable code</li></ul>",
        "coursePrice": 79.99,
        "isPublished": true,
        "discount": 15,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Advanced OOP Concepts",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "Metaclasses in Python",
                        "lectureDuration": 20,
                        "lectureUrl": "https://youtu.be/HdLIMoQkXFA",
                        "isPreviewFree": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Decorators and Generators",
                        "lectureDuration": 25,
                        "lectureUrl": "https://youtu.be/rKP7bW3Z6d0",
                        "isPreviewFree": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [],
        "courseRatings": [
            {
                "userId": "user_3",
                "rating": 5
            }
        ],
        "courseThumbnail": "https://img.youtube.com/vi/HdLIMoQkXFA/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1a3",
        "courseTitle": "Full-Stack Web Development with React and Node.js",
        "courseDescription": "<h2>Build Complete Web Apps</h2><p>Learn how to create scalable full-stack web applications using React on the frontend and Node.js with Express and MongoDB on the backend.</p><ul><li>Create RESTful APIs</li><li>Manage application state with React</li><li>Deploy applications to cloud platforms</li></ul>",
        "coursePrice": 99.99,
        "isPublished": true,
        "discount": 25,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Frontend with React",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "React Fundamentals",
                        "lectureDuration": 30,
                        "lectureUrl": "https://youtu.be/jZFaMEqEqEQ",
                        "isPreviewFree": true,
                        "lectureOrder": 1
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [],
        "courseRatings": [
            {
                "userId": "user_4",
                "rating": 5
            }
        ],
        "courseThumbnail": "https://img.youtube.com/vi/jZFaMEqEqEQ/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1a4",
        "courseTitle": "Mastering UI/UX Design with Figma",
        "courseDescription": "<h2>Design Beautiful Interfaces</h2><p>Learn the principles of UI and UX design, typography, color theory, and how to create interactive prototypes using Figma.</p><ul><li>Understand user-centered design</li><li>Create high-fidelity wireframes</li><li>Build reusable design systems</li></ul>",
        "coursePrice": 59.99,
        "isPublished": true,
        "discount": 10,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterOrder": 1,
                "chapterTitle": "Getting Started with Figma",
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "Figma Interface and Basics",
                        "lectureDuration": 15,
                        "lectureUrl": "https://youtu.be/lpx2zFkapIk",
                        "isPreviewFree": true,
                        "lectureOrder": 1
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [],
        "courseRatings": [
            {
                "userId": "user_5",
                "rating": 4
            }
        ],
        "courseThumbnail": "https://img.youtube.com/vi/lpx2zFkapIk/maxresdefault.jpg"
    }
];

const seed = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB for seeding...");

        // Ensure educator exists
        const existingEducator = await User.findById(dummyEducator._id);
        if (!existingEducator) {
            await User.create(dummyEducator);
            console.log("Seeded dummy educator:", dummyEducator.name);
        }

        // Seed courses if none exist
        const courseCount = await Course.countDocuments();
        if (courseCount === 0) {
            await Course.insertMany(dummyCourses);
            console.log(`Seeded ${dummyCourses.length} initial courses successfully!`);
        } else {
            console.log(`Database already has ${courseCount} courses. Skipping seed.`);
        }

        await mongoose.disconnect();
        console.log("Seeding complete. Disconnected.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();

