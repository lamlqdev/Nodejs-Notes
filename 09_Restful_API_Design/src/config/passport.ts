import { Strategy as JwtStrategy, ExtractJwt, type StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import type { Request } from 'express';

import config from './config';
import { findUserById } from '../services/user.service';
import type { TokenPayload } from '../utils/jwt.util';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.accessToken;
      }
      return token;
    },
  ]),
  secretOrKey: config.jwtSecret,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload: TokenPayload, done) => {
  try {
    const user = await findUserById(payload.userId);
    if (!user) {
      return done(null, false);
    }
    return done(null, {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as 'admin' | 'user',
    });
  } catch (error) {
    return done(error as Error, false);
  }
});

passport.use(jwtStrategy);

export default passport;