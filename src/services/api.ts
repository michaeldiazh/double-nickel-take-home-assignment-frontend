import { API_BASE_URL } from '../utils/constants';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse, Job, User } from '../types';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid email or password');
    }
    throw new Error('Login failed');
  }

  return response.json();
}

export async function getAllJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/jobs`);

  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }

  return response.json();
}

export async function deleteJobApplication(applicationId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/application/${applicationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete job application');
  }
} 


export async function getUserData(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to get user data');
  }

  return response.json();
}

export async function signup(userData: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Email already exists');
    }
    if (response.status === 400) {
      throw new Error('Invalid signup data');
    }
    throw new Error('Signup failed');
  }

  return response.json();
}