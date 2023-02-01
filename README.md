# cat.bio
Build system and source files for my portfolio/personal site cat.bio.

Build and run locally:
```
# Rebuild CV pdf/docx
cargo run --manifest-path prebuild/Cargo.toml

# Build and serve site locally
zola serve
```

Run in docker:
```
# Build docker image and start container
docker-compose -d --build
```
