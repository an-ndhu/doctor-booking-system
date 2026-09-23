export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Doctor Booking API',
    version: '1.0.0',
    description: [
      'Clinic appointment booking API.',
      '',
      '**Try it here:** use **Authorize** after login and paste the JWT.',
      '',
      'Seed accounts (after `npx sequelize-cli db:seed:all`):',
      '- Admin: `admin@example.com` / `Password123`',
      '- User: `user@example.com` / `Password123`',
      '',
      '`dayOfWeek`: 0 = Sunday … 6 = Saturday. Appointment `startAt` is ISO-8601 UTC; the server derives a 30-minute `endAt`.',
    ].join('\n'),
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Admin - Clinic' },
    { name: 'Admin - Users' },
    { name: 'Admin - Doctors' },
    { name: 'Admin - Scheduling' },
    { name: 'Doctors' },
    { name: 'Appointments' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      Id: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          clinicId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Jane Patient' },
          email: { type: 'string', example: 'user@example.com' },
          role: { type: 'string', enum: ['ADMIN', 'USER'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Clinic: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Kochi Medical Centre' },
          timezone: { type: 'string', example: 'Asia/Kolkata' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Doctor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          clinicId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Dr. John' },
          specialization: { type: 'string', example: 'Cardiology' },
          email: { type: 'string', nullable: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Schedule: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          doctorId: { type: 'integer' },
          dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 },
          startTime: { type: 'string', example: '09:00:00' },
          endTime: { type: 'string', example: '13:00:00' },
        },
      },
      Exception: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          doctorId: { type: 'integer' },
          type: { type: 'string', enum: ['BREAK', 'LEAVE', 'UNAVAILABLE'] },
          startAt: { type: 'string', format: 'date-time' },
          endAt: { type: 'string', format: 'date-time' },
          reason: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Slot: {
        type: 'object',
        properties: {
          startAt: { type: 'string', format: 'date-time', example: '2026-09-25T03:30:00.000Z' },
          endAt: { type: 'string', format: 'date-time', example: '2026-09-25T04:00:00.000Z' },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          clinicId: { type: 'integer' },
          doctorId: { type: 'integer' },
          userId: { type: 'integer' },
          startAt: { type: 'string', format: 'date-time' },
          endAt: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['BOOKED', 'CANCELLED', 'COMPLETED'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'API is healthy' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a USER in the default clinic',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', minLength: 8, example: 'Password123' },
                  role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    default: 'USER',
                    description: 'Public registration only accepts USER. Admins must be created via POST /api/admin/users.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Registered; returns user and JWT' },
          '400': { description: 'Validation failed' },
          '403': { description: 'Attempted to register as ADMIN' },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'JWT in data.token — paste it into Authorize' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Authenticated user' },
          '401': { description: 'Missing or invalid token' },
        },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin - Users'],
        summary: 'List clinic users',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Users' }, '403': { description: 'Not an admin' } },
      },
      post: {
        tags: ['Admin - Users'],
        summary: 'Create a user with role USER or ADMIN',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Sam Staff' },
                  email: { type: 'string', example: 'sam@example.com' },
                  password: { type: 'string', example: 'Password123' },
                  role: { type: 'string', enum: ['USER', 'ADMIN'], default: 'USER', example: 'USER' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
          '403': { description: 'Not an admin' },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/api/admin/users/{id}': {
      get: {
        tags: ['Admin - Users'],
        summary: 'Get a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'User' }, '404': { description: 'Not found' } },
      },
      put: {
        tags: ['Admin - Users'],
        summary: 'Update name, email, password, or role',
        description:
          'Role is editable. Existing JWTs keep the old role until the user logs in again. The last admin in a clinic cannot be demoted.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'ADMIN' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated' },
          '422': { description: 'Last admin cannot be demoted' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/admin/clinic': {
      get: {
        tags: ['Admin - Clinic'],
        summary: 'Get the admin clinic',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Clinic including timezone' },
          '401': { description: 'Unauthenticated' },
          '403': { description: 'Not an admin' },
        },
      },
    },
    '/api/admin/clinic/timezone': {
      put: {
        tags: ['Admin - Clinic'],
        summary: 'Set clinic IANA timezone',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['timezone'],
                properties: {
                  timezone: { type: 'string', example: 'Asia/Kolkata' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Timezone updated' },
          '400': { description: 'Invalid IANA timezone' },
          '403': { description: 'Not an admin' },
        },
      },
    },
    '/api/admin/doctors': {
      get: {
        tags: ['Admin - Doctors'],
        summary: 'List all doctors including inactive',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Doctor list' }, '403': { description: 'Forbidden' } },
      },
      post: {
        tags: ['Admin - Doctors'],
        summary: 'Create a doctor',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'specialization'],
                properties: {
                  name: { type: 'string', example: 'Dr. Ada' },
                  specialization: { type: 'string', example: 'Neurology' },
                  email: { type: 'string', example: 'ada@example.com' },
                  isActive: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' }, '403': { description: 'Forbidden' } },
      },
    },
    '/api/admin/doctors/{id}': {
      get: {
        tags: ['Admin - Doctors'],
        summary: 'Get a doctor',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'Doctor' }, '404': { description: 'Not found' } },
      },
      put: {
        tags: ['Admin - Doctors'],
        summary: 'Update a doctor',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  specialization: { type: 'string' },
                  email: { type: 'string', nullable: true },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Updated' }, '404': { description: 'Not found' } },
      },
      delete: {
        tags: ['Admin - Doctors'],
        summary: 'Deactivate a doctor (soft delete)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'isActive set to false' }, '404': { description: 'Not found' } },
      },
    },
    '/api/admin/doctors/{id}/schedule': {
      put: {
        tags: ['Admin - Scheduling'],
        summary: 'Replace working intervals for one weekday',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['dayOfWeek', 'intervals'],
                properties: {
                  dayOfWeek: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
                  intervals: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['start', 'end'],
                      properties: {
                        start: { type: 'string', example: '09:00' },
                        end: { type: 'string', example: '13:00' },
                      },
                    },
                    example: [
                      { start: '09:00', end: '13:00' },
                      { start: '14:00', end: '17:00' },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Schedule rows for that day' },
          '400': { description: 'Invalid or overlapping intervals' },
        },
      },
    },
    '/api/admin/doctors/{id}/exceptions': {
      get: {
        tags: ['Admin - Scheduling'],
        summary: 'List availability exceptions',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'Exceptions' } },
      },
      post: {
        tags: ['Admin - Scheduling'],
        summary: 'Add break, leave, or unavailable period',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'startAt', 'endAt'],
                properties: {
                  type: { type: 'string', enum: ['BREAK', 'LEAVE', 'UNAVAILABLE'], example: 'BREAK' },
                  startAt: { type: 'string', format: 'date-time', example: '2026-09-25T04:30:00.000Z' },
                  endAt: { type: 'string', format: 'date-time', example: '2026-09-25T05:00:00.000Z' },
                  reason: { type: 'string', example: 'Morning break' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' }, '400': { description: 'Invalid range' } },
      },
    },
    '/api/admin/exceptions/{id}': {
      delete: {
        tags: ['Admin - Scheduling'],
        summary: 'Delete an exception',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } },
      },
    },
    '/api/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'List active doctors',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Active doctors for the caller clinic' } },
      },
    },
    '/api/doctors/{id}': {
      get: {
        tags: ['Doctors'],
        summary: 'Get an active doctor',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'Doctor' }, '404': { description: 'Not found' } },
      },
    },
    '/api/doctors/{id}/availability': {
      get: {
        tags: ['Doctors'],
        summary: 'Available 30-minute slots for a local clinic date',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Id' },
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date', example: '2026-09-25' },
          },
        ],
        responses: { '200': { description: 'ISO-8601 UTC slots' }, '404': { description: 'Doctor not found' } },
      },
    },
    '/api/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'List appointments (own, or clinic-wide for admin)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Appointments' } },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Book a slot',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['doctorId', 'startAt'],
                properties: {
                  doctorId: { type: 'integer', example: 1 },
                  startAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-09-25T03:30:00.000Z',
                    description: 'Must match an available slot start. Server sets endAt = start + 30 minutes.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Booked' },
          '409': { description: 'APPOINTMENT_CONFLICT' },
          '422': { description: 'Slot not bookable (inactive doctor, outside hours, in the past)' },
        },
      },
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get one appointment',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: {
          '200': { description: 'Appointment' },
          '403': { description: 'Not the owner' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
};
