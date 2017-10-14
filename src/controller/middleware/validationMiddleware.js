import { check, validationResult } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import ValidationError from '../../error/validationError';
import User from '../../data/model/userModel';

export const checkUsername =
  check('username', 'Username must only contain alphanumeric characters')
    .exists()
    .isAlphanumeric()
    .not()
    .isEmpty();

export const checkUsernameUnique =
  check('username')
    .custom(value => User.count({ username: value }).exec().then((count) => {
      if (count > 0) {
        throw new Error('Username is already in use');
      }
      return true;
    }));

export const checkEmailUnique =
  check('email')
    .custom(value => User.count({ email: value }).exec().then((count) => {
      if (count > 0) {
        throw new Error('Email is already in use');
      }
      return true;
    }));

export const checkPassword =
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be of minimum 8 characters length')
    .exists();

export const checkPasswordConfirmation =
  check('passwordConfirmation')
    .exists()
    .isLength({ min: 8 }).withMessage('Password must be of minimum 8 characters length')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password confirmation must match password');

export const checkEmail =
  check('email')
    .exists()
    .isEmail()
    .not()
    .isEmpty();

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req)
    .formatWith(({ param, location, msg, value }) => {
      if (param === 'password' || param === 'passwordConfirmation') {
        // exclude password field value
        return { param, location, msg };
      }

      return { param, location, value, msg };
    });

  if (!errors.isEmpty()) {
    return next(new ValidationError(errors.array(), 'Validation failed'));
  }

  res.locals.validatedBody = matchedData(req);
  return next();
};