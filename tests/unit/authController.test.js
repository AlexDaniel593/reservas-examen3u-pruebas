const { register } = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

// Mocks
jest.mock('../../src/models/User');
jest.mock('bcryptjs');

describe('Auth Controller - Register', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        // Mock User.findOne to return null (user does not exist)
        User.findOne.mockResolvedValue(null);
        // Mock bcrypt.hash
        bcrypt.hash.mockResolvedValue('hashedPassword');
        // Mock User constructor and save method
        User.prototype.save = jest.fn().mockResolvedValue({});

        await register(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(User.prototype.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario creado' });
    });

    it('should return 400 if user already exists', async () => {
        // Mock User.findOne to return an existing user
        User.findOne.mockResolvedValue({ email: 'test@example.com' });

        await register(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ya existe el usuario' });
    });

    it('should return 500 on server error', async () => {
        const errorMessage = 'Database error';
        User.findOne.mockRejectedValue(new Error(errorMessage));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
});
