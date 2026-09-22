import { NextFunction, Request, Response } from 'express';
import {
  LoginResponse,
  User,
  UserResponse,
  UserWithNoPassword,
} from 'hybrid-types';
import jwt from 'jsonwebtoken';
import { Secret, TOTP } from 'otpauth';
import QRCode from 'qrcode';
import CustomError from '../../../classes/CustomError';
import fetchData from '../../../utils/FetchData';
import { MFA, MFAModel } from '../models/mfaModel';

type MfaSecretResponse = {
  email: string;
  secret: string;
};

type MfaRegistrationResponse = UserResponse & {
  otpauthUri: string;
  qrCode: string;
};

type MfaVerificationRequest = Partial<Pick<MFA, 'email'>> & {
  code?: string;
};

const authApiUrl = 'https://media2.edu.metropolia.fi/auth-api';

export const generateMfaSecret = (
  request: Request<unknown, MfaSecretResponse, Partial<Pick<User, 'email'>>>,
  response: Response<MfaSecretResponse>,
  next: NextFunction,
): void => {
  try {
    const { email } = request.body;

    if (!email) {
      throw new CustomError('Email is required', 400);
    }

    const secret = new Secret();

    response.json({
      email,
      secret: secret.base32,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError('Failed to generate MFA secret', 500),
    );
  }
};

export const registerUser = async (
  request: Request<
    unknown,
    MfaRegistrationResponse,
    Partial<Pick<User, 'username' | 'email' | 'password'>>
  >,
  response: Response<MfaRegistrationResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      throw new CustomError('Username, email, and password are required', 400);
    }

    const user = await fetchData<UserResponse>(`${authApiUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      } satisfies Pick<User, 'username' | 'email' | 'password'>),
    });

    const secret = new Secret();

    await MFAModel.create({
      userId: user.user.user_id,
      email: user.user.email,
      secret: secret.base32,
    });

    const totp = new TOTP({
      issuer: 'MFA',
      label: user.user.email,
      secret,
    });
    const otpauthUri = totp.toString();
    const qrCode = await QRCode.toDataURL(otpauthUri);

    response.status(201).json({
      ...user,
      otpauthUri,
      qrCode,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(
            error instanceof Error ? error.message : 'User registration failed',
            500,
          ),
    );
  }
};

export const verifyMfaCode = async (
  request: Request<unknown, LoginResponse, MfaVerificationRequest>,
  response: Response<LoginResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, code } = request.body;

    if (!email || !code) {
      throw new CustomError('Email and TOTP code are required', 400);
    }

    const mfaData = await MFAModel.findOne({ email });

    if (!mfaData) {
      throw new CustomError('MFA data not found', 404);
    }

    const secret = Secret.fromBase32(mfaData.secret);
    const tokenDelta = TOTP.validate({
      token: code,
      secret,
    });

    if (tokenDelta === null) {
      throw new CustomError('Invalid TOTP code', 401);
    }

    const user = await fetchData<UserWithNoPassword>(
      `${authApiUrl}/api/v1/users/${mfaData.userId}`,
    );

    console.log(user, mfaData);

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new CustomError('JWT_SECRET is not defined', 500);
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        level_name: user.level_name,
      },
      jwtSecret,
    );

    response.json({
      user,
      message: 'MFA login successful',
      token,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(
            error instanceof Error ? error.message : 'MFA verification failed',
            500,
          ),
    );
  }
};
