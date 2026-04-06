from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class AccountsAPITest(APITestCase):
    def test_register(self):
        url = reverse('register')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Testpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_login(self):
        register_url = reverse('register')
        login_url = reverse('login')
        self.client.post(register_url, {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Testpass123'
        }, format='json')
        response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'Testpass123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

