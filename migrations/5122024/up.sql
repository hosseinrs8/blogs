create table if not exists users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(128) not null ,
    email varchar(128) not null ,
    password varchar (512) not null
);

create table if not exists sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    token varchar (2048) not null ,
    "userId" uuid references users(id),
    "revokedAt" timestamp default null
);

create table if not exists blogs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title varchar not null ,
    content varchar(5000) not null ,
    image varchar(1024) default null ,
    "imageId" uuid default null,
    "owner" uuid references users(id) not null,
    "createdAt" timestamp default now()
);