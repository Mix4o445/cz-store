import { z } from 'zod';
import { User } from '../models/User.model.js';
import { ok } from '../utils/apiResponse.js';
import { badRequest, notFound, conflict } from '../utils/apiError.js';

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().or(z.literal('')),
});

const addressSchema = z.object({
  label: z.string().optional().or(z.literal('')),
  name: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().min(3),
  city: z.string().min(2),
  wilaya: z.string().optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

export async function updateProfile(req, res, next) {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    if (parsed.data.email) {
      const exists = await User.findOne({ email: parsed.data.email, _id: { $ne: req.user.sub } });
      if (exists) throw conflict('Email already in use');
    }

    const user = await User.findByIdAndUpdate(req.user.sub, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw notFound('User not found');
    return ok(res, user, 'Profile updated');
  } catch (e) {
    next(e);
  }
}

export async function listAddresses(req, res, next) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) throw notFound();
    return ok(res, user.addresses ?? []);
  } catch (e) {
    next(e);
  }
}

export async function addAddress(req, res, next) {
  try {
    const parsed = addressSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    const user = await User.findById(req.user.sub);
    if (!user) throw notFound();

    if (parsed.data.isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    } else if (user.addresses.length === 0) {
      // First address auto-default
      parsed.data.isDefault = true;
    }
    user.addresses.push(parsed.data);
    await user.save();
    return ok(res, user.addresses, 'Address added');
  } catch (e) {
    next(e);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const parsed = addressSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    const user = await User.findById(req.user.sub);
    if (!user) throw notFound();
    const addr = user.addresses.id(req.params.id);
    if (!addr) throw notFound('Address not found');

    if (parsed.data.isDefault) {
      user.addresses.forEach((a) => {
        if (a._id.toString() !== req.params.id) a.isDefault = false;
      });
    }
    Object.assign(addr, parsed.data);
    await user.save();
    return ok(res, user.addresses, 'Address updated');
  } catch (e) {
    next(e);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) throw notFound();
    const addr = user.addresses.id(req.params.id);
    if (!addr) throw notFound('Address not found');
    addr.deleteOne();
    // If we removed the default and there are other addresses, promote the first one
    if (addr.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    return ok(res, user.addresses, 'Address deleted');
  } catch (e) {
    next(e);
  }
}
