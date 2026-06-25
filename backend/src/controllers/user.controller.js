import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { usersRepo } from '../db/users.repo.js';
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
      const exists = await usersRepo.emailExists(parsed.data.email, req.user.sub);
      if (exists) throw conflict('Email already in use');
    }

    const user = await usersRepo.updateById(req.user.sub, parsed.data);
    if (!user) throw notFound('User not found');
    return ok(res, user, 'Profile updated');
  } catch (e) {
    next(e);
  }
}

export async function listAddresses(req, res, next) {
  try {
    const raw = await usersRepo._rawById(req.user.sub);
    if (!raw) throw notFound();
    return ok(res, raw.addresses ?? []);
  } catch (e) {
    next(e);
  }
}

export async function addAddress(req, res, next) {
  try {
    const parsed = addressSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    const raw = await usersRepo._rawById(req.user.sub);
    if (!raw) throw notFound();
    const addresses = raw.addresses ?? [];

    const next_ = { ...parsed.data, _id: randomUUID() };
    if (next_.isDefault) {
      addresses.forEach((a) => {
        a.isDefault = false;
      });
    } else if (addresses.length === 0) {
      next_.isDefault = true;
    }
    addresses.push(next_);

    const user = await usersRepo.setAddresses(req.user.sub, addresses);
    return ok(res, user.addresses, 'Address added');
  } catch (e) {
    next(e);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const parsed = addressSchema.partial().safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    const raw = await usersRepo._rawById(req.user.sub);
    if (!raw) throw notFound();
    const addresses = raw.addresses ?? [];
    const addr = addresses.find((a) => String(a._id) === req.params.id);
    if (!addr) throw notFound('Address not found');

    if (parsed.data.isDefault) {
      addresses.forEach((a) => {
        if (String(a._id) !== req.params.id) a.isDefault = false;
      });
    }
    Object.assign(addr, parsed.data);

    const user = await usersRepo.setAddresses(req.user.sub, addresses);
    return ok(res, user.addresses, 'Address updated');
  } catch (e) {
    next(e);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const raw = await usersRepo._rawById(req.user.sub);
    if (!raw) throw notFound();
    const addresses = raw.addresses ?? [];
    const addr = addresses.find((a) => String(a._id) === req.params.id);
    if (!addr) throw notFound('Address not found');

    const remaining = addresses.filter((a) => String(a._id) !== req.params.id);
    // If we removed the default and others remain, promote the first one.
    if (addr.isDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
    }

    const user = await usersRepo.setAddresses(req.user.sub, remaining);
    return ok(res, user.addresses, 'Address deleted');
  } catch (e) {
    next(e);
  }
}
