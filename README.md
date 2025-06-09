Supersed by https://github.com/poooi/r2-index-kai

----------------------

# R2 Index

Index UI for Cloudflare R2 storage

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Development](#development)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

R2 Index is a project designed to provide a storage index similar to typical file servers on Apache or Nginx. Currently, it works together with [r2-ingress](https://github.com/poooi/r2-ingress) due to tooling restrictions. A brief architecture is shown below.

![image](https://github.com/user-attachments/assets/d4645815-abaa-480f-ac14-a7060cc09cbe)

`r2-ingress` would be the entry point of the service, and `r2-index` serves as a [service binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/).

## Features

- File index page
- Filtering file names
- Ordering by file name, size, and modified date
  and more will come

## Development

To install the project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/poooi/r2-index.git
```

2. Navigate to the project directory:

```bash
cd r2-index
```

3. Install the dependencies:

```bash
pnpm install
```

## Usage

To use the project, first you need to assign your R2 bucket with a custom domain, which will be the same domain as `r2-ingress`. Then for this project, just change the worker configuration in `wrangler.toml` to fit your situation, as well as the R2 site config. Explanation:

| config name   | usage                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| name          | worker name                                                                                                                                           |
| account_id    | optional, useful for manual deployment when the user has access to multiple Cloudflare accounts                                                       |
| assets        | asset binding for worker with assets, required by `opennext-cloudflare`                                                                               |
| r2_buckets    | R2 storage bindings                                                                                                                                   |
| kv_namespaces | required by `opennext-cloudflare` to save temp files                                                                                                  |
| observability | optional, send logs to the worker logs tab                                                                                                            |
| routes        | URLs that the r2-ingress should take, usually the same as the domain assigned to the R2 bucket, Cloudflare will route the traffic to the worker first |
| services      | service binding so that the 2 workers could be bound together                                                                                         |

To update TypeScript definition, run `corepack pnpm cf-typegen`.

After deploying this worker, you'll also need to change the service binding in `r2-ingress` and have it deployed.

## Contributing

We welcome contributions! Please follow these steps to contribute:

1. Fork and clone the repository.
2. Create a new branch:

```bash
git checkout -b feature-branch
```

3. Make your changes and commit them:

```bash
git commit -m "Description of your changes"
```

4. Push to the branch:

```bash
git push origin feature-branch
```

5. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
