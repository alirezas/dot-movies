# Changelog

## v1.3.1

### 🩹 Fixes

- **tvdb:** Match movies by exact title before TVDB's top result ([5b033db](https://github.com/alirezas/dot-movies/commit/5b033db))
- **tvdb:** Require an exact title match when matching movies ([0f16e5a](https://github.com/alirezas/dot-movies/commit/0f16e5a))

### 📖 Documentation

- Describe TVDB title matching ([3e2c231](https://github.com/alirezas/dot-movies/commit/3e2c231))

### ❤️ Contributors

- Alireza Sarabchi ([@alirezas](https://github.com/alirezas))

## v1.3.0

### 🚀 Enhancements

- **db:** Add people and movie_people tables ([da363ff](https://github.com/alirezas/dot-movies/commit/da363ff))
- Sync movie credits into people tables ([d96bff3](https://github.com/alirezas/dot-movies/commit/d96bff3))
- Add person pages ([2db7831](https://github.com/alirezas/dot-movies/commit/2db7831))

### 💅 Refactors

- Share TVDB artwork URL helper ([669a1e8](https://github.com/alirezas/dot-movies/commit/669a1e8))

### 📖 Documentation

- Add CLAUDE.md with commands and architecture overview ([35263ae](https://github.com/alirezas/dot-movies/commit/35263ae))
- Document person pages and people CLIs ([0d23181](https://github.com/alirezas/dot-movies/commit/0d23181))

### ❤️ Contributors

- Alireza Sarabchi ([@alirezas](https://github.com/alirezas))

## v1.2.0

### 🚀 Enhancements

- **movie:** Netflix-style hero layout for the movie page ([78f5cea](https://github.com/alirezas/dot-movies/commit/78f5cea))
- **movie:** Play trailers in a modal ([3201093](https://github.com/alirezas/dot-movies/commit/3201093))

### 🩹 Fixes

- **import:** Allow re-selecting the same file in the import form ([28e9600](https://github.com/alirezas/dot-movies/commit/28e9600))
- **movie-card:** Let clicks pass through the border overlay ([f2908d2](https://github.com/alirezas/dot-movies/commit/f2908d2))

### 🏡 Chore

- **deps:** Update dependencies and add taze update script ([814e673](https://github.com/alirezas/dot-movies/commit/814e673))
- Run dev server on port 6001 and allow movies.dot.test origin ([dbda61d](https://github.com/alirezas/dot-movies/commit/dbda61d))
- Add Neon agent skills and ignore .neon ([f9493c8](https://github.com/alirezas/dot-movies/commit/f9493c8))

### 🤖 CI

- Use pnpm 12 and Node 24 to match local toolchain ([79c3543](https://github.com/alirezas/dot-movies/commit/79c3543))
- Build on Vercel instead of the runner ([ae1c27f](https://github.com/alirezas/dot-movies/commit/ae1c27f))

### ❤️ Contributors

- Alireza Sarabchi ([@alirezas](https://github.com/alirezas))

## v1.1.0


### 🚀 Enhancements

- Overhaul import page with dropzone, per-movie log viewer, and filters ([23e5e51](https://github.com/alirezas/dot-movies/commit/23e5e51))

### 🩹 Fixes

- Move dotenv loading from db init to CLI entry points ([4fe700e](https://github.com/alirezas/dot-movies/commit/4fe700e))

### 🤖 CI

- Separate validate (lint+typecheck) from deploy (Vercel handles build with env vars) ([c9c550f](https://github.com/alirezas/dot-movies/commit/c9c550f))

### ❤️ Contributors

- Alireza Sarabchi ([@alirezas](https://github.com/alirezas))

## v1.0.0 (2026-03-20)

Initial stable release