import childProccess from 'child_process';

function isExecError(err: unknown): err is { stdout: Buffer; stderr: Buffer } {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    Buffer.isBuffer((err as any).stdout) && Buffer.isBuffer((err as any).stderr)
  );
}

function deploy() {
  if (process.argv[2] === 'production') {
    try {
      childProccess.execSync('yarn build:production');
    } catch (err) {
      console.log(err);
      if (isExecError(err)) {
        console.log(String(err.stdout));
        console.log(String(err.stderr));
      }
      return;
    }

    try {
      childProccess.execSync('yarn listBuildFiles');
    } catch (err) {
      console.log(err);
      if (isExecError(err)) {
        console.log(String(err.stdout));
        console.log(String(err.stderr));
      }
      return;
    }

    try {
      childProccess.execSync(
        'AWS_PROFILE=neutek-locator-production AWS_REGION=us-east-1 aws s3 sync build s3://neutek-locator-widget-production/',
      );
    } catch (err) {
      console.log(err);
      if (isExecError(err)) {
        console.log(String(err.stdout));
        console.log(String(err.stderr));
      }
    }
  } else if (process.argv[2] === 'staging') {
    try {
      childProccess.execSync('yarn build:staging');
    } catch (err) {
      console.log(err);
      if (isExecError(err)) {
        console.log(String(err.stdout));
        console.log(String(err.stderr));
      }
      return;
    }

    try {
      childProccess.execSync('yarn listBuildFiles');
    } catch (err) {
      console.log(err);
      if (isExecError(err)) {
        console.log(String(err.stdout));
        console.log(String(err.stderr));
      }
      return;
    }

    try {
      childProccess.execSync(
        'AWS_PROFILE=neutek-locator-staging AWS_REGION=us-east-1 aws s3 sync build s3://neutek-locator-widget-staging/',
      );
    } catch (err) {
      console.log(err);
      if (isExecError(err)) {
        console.log(String(err.stdout));
        console.log(String(err.stderr));
      }
    }
  } else {
    console.log(`Invalid input: ${process.argv[2]}`);
  }
}

deploy();
