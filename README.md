bootstrap() is an ASYNC FUNCTION
that initializes the entire
NestJS application

waht is ioc container?


NestJS gives you:
→ Way to organize routes (Controller)
→ Way to organize logic (Service)
→ Way to connect things (Module)
→ Built-in validation (ValidationPipe)
→ Built-in dependency injection (IoC)


┌─────────────────────┐
│     LAYER 1         │
│     CONTROLLER      │  ← handles HTTP
└─────────────────────┘
          ↓
┌─────────────────────┐
│     LAYER 2         │
│     SERVICE         │  ← handles logic
└─────────────────────┘
          ↓
┌─────────────────────┐
│     LAYER 3         │
│     PRISMA          │  ← talk to database
└─────────────────────┘
          ↓
┌─────────────────────┐
│     LAYER 4         │
│     POSTGRESQL      │  ← stores data
└─────────────────────┘

CONTROLLER  → receives request, sends response
SERVICE     → applies business rules
PRISMA      → talks to database
POSTGRESQL  → stores data


CLIENT sends request
       ↓
CONTROLLER receives it
       ↓
SERVICE does the work
       ↓
PRISMA queries database
       ↓
POSTGRESQL returns data
       ↓
PRISMA returns to service
       ↓
SERVICE returns to controller
       ↓
CONTROLLER sends response
       ↓
CLIENT gets answer


3 Supporting Things
┌─────────────────────┐
│      main.ts        │  ← starts everything(All requests ENTER through main.ts
All responses EXIT through main.ts
main.ts is the ONLY door!)
└─────────────────────┘
          ↓
┌─────────────────────┐
│      MODULE         │  ← wires layers together{ Connects layers together}
└─────────────────────┘
          ↓
┌─────────────────────┐
│      DTO            │  ← checks incoming data
└─────────────────────┘
          ↓
┌─────────────────────┐
│     CONTROLLER      │
└─────────────────────┘
          ↓
┌─────────────────────┐
│      SERVICE        │
└─────────────────────┘
          ↓
┌─────────────────────┐
│      PRISMA         │
└─────────────────────┘
          ↓
┌─────────────────────┐
│     POSTGRESQL      │
└─────────────────────┘


main.ts
= Starting point
= Like pressing power button
= Runs once, starts everything

(When you run:
npm run start:dev

main.ts WAKES UP first
Then wakes up everything else
One by one)

MODULE
= Wiring box
= Connects controller + service together
= Like introducing people to each other

{
  Module = HR Department

HR introduces:
→ "This is the receptionist (Controller)"
→ "This is the worker (Service)"
→ "They need the database (Prisma)"

After introduction:
→ Everyone knows their job
→ Everyone knows who to call
→ HR steps back
}


DTO (for validating data)
ValidationPipe is NOT a file you create!
It is a BUILT-IN tool from NestJS in main.ts
= Data checker
= Checks incoming data is correct
= Rejects bad data before controller
{
employee_code → must not be empty
name          → must be text
email         → must be valid email
joining_date  → must be valid date
}

Only DTO, no ValidationPipe:
→ Rules exist but nobody checks them
→ Bad data passes through freely ❌

Only ValidationPipe, no DTO:
→ Checker exists but no rules to check
→ Doesn't know what is valid or invalidyes ❌

example
{{{{{{ @Body()
→ "Get the JSON data from request body"

dto
→ "Store it in this variable called dto"

: CreateEmployeeDto
→ "Use CreateEmployeeDto rules to validate it"
→ THIS is where DTO connects!
→ THIS triggers ValidationPipe! }}}}}}


Request comes in
      ↓
Controller says:
"@Body() dto: CreateEmployeeDto"
      ↓
NestJS understands:
"Oh! Use CreateEmployeeDto rules!"
      ↓
ValidationPipe activates:
Reads CreateEmployeeDto rules
Checks incoming data
      ↓
FAIL → 400 error ❌
PASS → dto variable filled ✅
      ↓
Controller gets clean validated data

The 3 Things Working Together
ValidationPipe    DTO                Controller
(set in main.ts)  (rules file)       (connection)

     ↓                ↓                  ↓
  "I check"    "These are rules"   @Body() dto: CreateEmployeeDto
                                         ↑
                                   "Check using THESE rules"

SERVICE
All decisions made in Service:
Service Uses PrismaService To Do Work
Employee Service:
→ Is employee_code duplicate?
→ Does employee exist before update?

Leave Request Service:
→ Does employee exist?
→ Does leave type exist?
→ Are dates valid?
→ Is there overlap?
→ Is balance enough?
→ Is status PENDING before approve?

SERVICE          PRISMASERVICE
───────          ─────────────
Makes decisions  Executes decisions
Checks rules     Runs SQL
Thinks           Acts
Brain            Hands

Together:
→ NestJS stores services (IoC)
→ NestJS gives them when needed (DI)
→ Everything efficient and clean ✅

Status Code = A NUMBER that tells you
              what happened with your request

              1xx = Information
2xx = Success ✅
3xx = Redirect
4xx = Client Error ❌ (you did something wrong)
5xx = Server Error ❌ (server did something wrong)

CREATE employee successfully
→ 201 Created ✅

GET all employees successfully
→ 200 OK ✅

Employee id not found
→ 404 Not Found ❌

DTO validation fails
→ 400 Bad Request ❌

Duplicate employee code
→ 409 Conflict ❌

Overlap in leave dates
→ 409 Conflict ❌

Insufficient balance
→ 400 Bad Request ❌

NestJS has built-in exceptions:

NotFoundException
→ When something not found
→ Returns 404 automatically

BadRequestException
→ When data is wrong
→ Returns 400 automatically

ConflictException
→ When duplicate/overlap exists
→ Returns 409 automatically nnest