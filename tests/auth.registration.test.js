const mockQuery = jest.fn();

jest.mock('../src/config/database', () => ({
  pool: {
    connect: jest.fn(),
  },
  query: mockQuery,
}));

jest.mock('../src/models/User', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
  verifyPassword: jest.fn(),
  deactivate: jest.fn(),
}));

jest.mock('../src/models/Business', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
}));

const { pool } = require('../src/config/database');
const User = require('../src/models/User');
const Business = require('../src/models/Business');
const authController = require('../src/controllers/authController');

describe('auth registration flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('public registration creates a business and owner in one transaction', async () => {
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 7 }] })
        .mockResolvedValueOnce({ rows: [{ id: 99, name: 'Acme Store', email: 'owner@example.com' }] }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);
    Business.create.mockResolvedValue({ id: 7, name: 'Acme Store' });
    User.create.mockResolvedValue({ id: 99, name: 'Owner Name', email: 'owner@example.com' });

    const req = {
      body: {
        name: 'Owner Name',
        email: 'owner@example.com',
        password: 'Secret123!',
        business_name: 'Acme Store',
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authController.register(req, res, next);

    expect(client.query).toHaveBeenCalledWith('BEGIN');
    expect(Business.create).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      business_id: 7,
      must_change_password: true,
    }), expect.anything());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(client.query).toHaveBeenCalledWith('COMMIT');
    expect(next).not.toHaveBeenCalled();
  });

  test('owners can create staff accounts with temporary passwords', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 2 }] }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);
    User.create.mockResolvedValue({ id: 33, name: 'Jane', email: 'jane@example.com' });

    const req = {
      user: { id: 1, business_id: 7, role: 'owner' },
      body: { name: 'Jane', email: 'jane@example.com', role: 'manager' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authController.createStaff(req, res, next);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      business_id: 7,
      must_change_password: true,
    }), expect.anything());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      temporary_password: expect.any(String),
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
