const testData = {
  name: "Test User",
  email: "test@example.com", 
  phone: "08123456789",
  school: "SMA Test",
  class: "XI IPA 1",
  interest: "Web Development",
  experience: "Beginner",
  message: "Test pendaftaran"
};

fetch('http://localhost:3000/api/registrations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('Test registration result:', data);
})
.catch(error => {
  console.error('Error:', error);
});
