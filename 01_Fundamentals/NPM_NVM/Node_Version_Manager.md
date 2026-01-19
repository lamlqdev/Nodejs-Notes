# NVM & Version Management

Understanding NVM (Node Version Manager) is essential for managing multiple Node.js versions across different projects and ensuring consistency in development environments.

---

## Core Terminology

### What is NVM and Why do we need it?

**NVM** (Node Version Manager) is a version manager for Node.js that allows you to install, manage, and switch between multiple versions of Node.js on a single machine. It provides a simple command-line interface to install different Node.js versions and automatically switch between them based on project requirements.

**Why NVM was created:** Different projects often require different Node.js versions. Without a version manager, you would need to manually uninstall and reinstall Node.js versions, which is time-consuming and error-prone. NVM solves this problem by allowing you to:

- Install multiple Node.js versions simultaneously
- Switch between versions quickly with a single command
- Automatically use the correct version for each project
- Test your application against different Node.js versions
- Ensure team consistency by sharing version requirements

### How to install NVM

**macOS and Linux:**

```bash
# Install using curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Or install using wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

After installation, you need to restart your terminal to apply the changes.

### Installing and Managing Node Versions

Once NVM is installed, you can install and manage Node.js versions easily.

**Install the latest LTS (Long-Term Support) version:**

```bash
nvm install --lts
```

**Install a specific version:**

```bash
nvm install 18.17.0
nvm install 20.5.0
nvm install 16.20.0
```

**Install the latest version:**

```bash
nvm install node
# or
nvm install latest
```

**List installed versions:**

```bash
nvm list
# or
nvm ls
```

**List available versions:**

```bash
nvm list-remote
# or
nvm ls-remote
```

**Switch to a specific version:**

```bash
nvm use 18.17.0
```

**Set a default version:**

```bash
nvm alias default 18.17.0
```

**Uninstall a version:**

```bash
nvm uninstall 16.20.0
```

**Key commands summary:**

| Command | Description |
|---------|-------------|
| `nvm install <version>` | Install a specific Node.js version |
| `nvm install --lts` | Install the latest LTS version |
| `nvm install node` | Install the latest version |
| `nvm use <version>` | Switch to a specific version |
| `nvm list` | List installed versions |
| `nvm list-remote` | List available versions to install |
| `nvm alias default <version>` | Set default version |
| `nvm uninstall <version>` | Remove a version |
| `nvm current` | Show currently active version |
| `nvm which <version>` | Show path to a version |

### Configuring Node Version in Project via .nvmrc

The `.nvmrc` file is a simple text file that specifies which Node.js version your project requires. When you navigate to a project directory containing `.nvmrc`, you can automatically switch to the correct version.

**Creating a .nvmrc file:**

```bash
# In your project root directory
echo "18.17.0" > .nvmrc
```

**Example .nvmrc content:**

```text
18.17.0
```

You can also use version aliases:

```text
lts/*
node
18
18.17
```

**Using .nvmrc:**

```bash
# Navigate to project directory
cd my-project

# Use the version specified in .nvmrc
nvm use

# Or explicitly specify the file
nvm use .nvmrc
```

**Automatic version switching:**

You can configure your shell to automatically switch Node.js versions when entering a directory with `.nvmrc`. Add this to your `~/.bashrc` or `~/.zshrc`:

```bash
# Auto-switch Node version when entering directory with .nvmrc
cdnvm() {
    command cd "$@";
    nvm_path=$(nvm_find_up .nvmrc | tr -d '\n')

    if [[ ! $nvm_path = *[^[:space:]]* ]]; then
        declare default_version;
        default_version=$(nvm version default);

        if [[ $default_version == "N/A" ]]; then
            nvm alias default node;
            default_version=$(nvm version default);
        fi

        if [[ $(nvm current) != "$default_version" ]]; then
            nvm use default;
        fi

        elif [[ -s $nvm_path/.nvmrc && -r $nvm_path/.nvmrc ]]; then
        declare nvm_version
        nvm_version=$(<"$nvm_path"/.nvmrc)

        declare locally_resolved_nvm_version
        locally_resolved_nvm_version=$(nvm ls --no-colors "$nvm_version" | tail -1 | tr -d '\n' | tr -d '\*')

        if [[ "$locally_resolved_nvm_version" == "N/A" ]]; then
            nvm install "$nvm_version";
        elif [[ $(nvm current) != "$locally_resolved_nvm_version" ]]; then
            nvm use "$nvm_version";
        fi
    fi
}
alias cd='cdnvm'
cd "$PWD"
```

**Key points:**

- `.nvmrc` should be committed to version control
- Team members can use `nvm use` to switch to the project's required version
- The file can contain version numbers, aliases, or version ranges
- This ensures consistency across development environments

---

## Examples and Explanation

### Example 1: Setting Up NVM for a New Project

**Scenario:** You're starting a new project that requires Node.js 18.17.0.

**Step 1: Install the required version:**

```bash
nvm install 18.17.0
```

**Step 2: Create .nvmrc file:**

```bash
cd my-new-project
echo "18.17.0" > .nvmrc
```

**Step 3: Use the version:**

```bash
nvm use
# Output: Now using node v18.17.0
```

**Step 4: Verify:**

```bash
node --version
# Output: v18.17.0
```

**Explanation:**

- Installing a version downloads and sets it up in NVM's directory
- The `.nvmrc` file documents the project's Node.js requirement
- `nvm use` reads `.nvmrc` and switches to that version
- This ensures anyone working on the project uses the correct version

### Example 2: Working with Multiple Projects

**Scenario:** You have two projects - one requires Node.js 16, another requires Node.js 20.

**Project A (requires Node 16):**

```bash
cd project-a
nvm install 16.20.0
echo "16.20.0" > .nvmrc
nvm use
node --version  # v16.20.0
```

**Project B (requires Node 20):**

```bash
cd project-b
nvm install 20.5.0
echo "20.5.0" > .nvmrc
nvm use
node --version  # v20.5.0
```

**Switching between projects:**

```bash
cd project-a
nvm use  # Automatically uses 16.20.0

cd project-b
nvm use  # Automatically uses 20.5.0
```

**Explanation:**

- NVM allows you to have multiple versions installed simultaneously
- Each project can specify its required version via `.nvmrc`
- Switching between projects automatically uses the correct version
- No need to uninstall/reinstall Node.js versions

### Example 3: Updating Node.js Version

**Scenario:** Your project needs to upgrade from Node.js 16 to Node.js 18.

**Step 1: Install the new version:**

```bash
nvm install 18.17.0
```

**Step 2: Test your application:**

```bash
nvm use 18.17.0
npm test
# Run your application and verify everything works
```

**Step 3: Update .nvmrc:**

```bash
echo "18.17.0" > .nvmrc
```

**Step 4: Set as default (optional):**

```bash
nvm alias default 18.17.0
```

**Step 5: Remove old version (optional):**

```bash
nvm uninstall 16.20.0
```

**Explanation:**

- You can test new versions without affecting existing projects
- Keep old versions until you're confident the upgrade works
- Update `.nvmrc` to reflect the new requirement
- Remove old versions only after confirming they're no longer needed

### Example 4: Team Collaboration with .nvmrc

**Scenario:** Ensuring all team members use the same Node.js version.

**Developer A (Project setup):**

```bash
# Install required version
nvm install 18.17.0

# Create .nvmrc
echo "18.17.0" > .nvmrc

# Commit to git
git add .nvmrc
git commit -m "Add .nvmrc for Node.js version"
git push
```

**Developer B (Joining the project):**

```bash
# Clone the repository
git clone https://github.com/team/project.git
cd project

# Install the version specified in .nvmrc
nvm install

# Use the version
nvm use

# Verify
node --version  # Should match .nvmrc
```

**Explanation:**

- `.nvmrc` serves as documentation for the project's Node.js requirement
- Team members can quickly set up the correct environment
- Reduces "works on my machine" issues
- Ensures consistent development and production environments

## References

- [NVM Official Repository (Unix)](https://github.com/nvm-sh/nvm)
- [NVM-Windows Repository](https://github.com/coreybutler/nvm-windows)
- [Node.js Releases](https://nodejs.org/en/about/releases/)
- [NVM Documentation](https://github.com/nvm-sh/nvm#readme)
