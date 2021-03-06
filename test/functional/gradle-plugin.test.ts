import { test } from 'tap';
import { exportsForTests as testableMethods } from '../../lib';
import * as os from 'os';

const isWin = /^win/.test(os.platform());
const quot = isWin ? '"' : "'";

test('check build args with array (new configuration arg)', async (t) => {
  const result = testableMethods.buildArgs('.', null, '/tmp/init.gradle', {
    'configuration-matching': 'confRegex',
    args: ['--build-file', 'build.gradle'],
  });
  t.deepEqual(result, [
    'snykResolvedDepsJson',
    '-q',
    `-Pconfiguration=${quot}confRegex${quot}`,
    '--no-daemon',
    '-Dorg.gradle.parallel=',
    '-Dorg.gradle.console=plain',
    '-PonlySubProject=.',
    '-I /tmp/init.gradle',
    '--build-file',
    'build.gradle',
  ]);
});

test('check build args with array (new configuration arg) with --deamon', async (t) => {
  const result = testableMethods.buildArgs('.', null, '/tmp/init.gradle', {
    daemon: true,
    'configuration-matching': 'confRegex',
    args: ['--build-file', 'build.gradle'],
  });
  t.deepEqual(result, [
    'snykResolvedDepsJson',
    '-q',
    `-Pconfiguration=${quot}confRegex${quot}`,
    '-Dorg.gradle.parallel=',
    '-Dorg.gradle.console=plain',
    '-PonlySubProject=.',
    '-I /tmp/init.gradle',
    '--build-file',
    'build.gradle',
  ]);
});

test('check build args with array (legacy configuration arg)', async (t) => {
  const result = testableMethods.buildArgs('.', null, '/tmp/init.gradle', {
    args: ['--build-file', 'build.gradle', '--configuration=compile'],
  });
  t.deepEqual(result, [
    'snykResolvedDepsJson',
    '-q',
    '--no-daemon',
    '-Dorg.gradle.parallel=',
    '-Dorg.gradle.console=plain',
    '-PonlySubProject=.',
    '-I /tmp/init.gradle',
    '--build-file',
    'build.gradle',
    `-Pconfiguration=${quot}^compile$${quot}`,
  ]);
});

test('check build args with scan all subprojects', async (t) => {
  const result = testableMethods.buildArgs('.', null, '/tmp/init.gradle', {
    allSubProjects: true,
    args: ['--build-file', 'build.gradle', '--configuration', 'compile'],
  });
  t.deepEqual(result, [
    'snykResolvedDepsJson',
    '-q',
    '--no-daemon',
    '-Dorg.gradle.parallel=',
    '-Dorg.gradle.console=plain',
    '-I /tmp/init.gradle',
    '--build-file',
    'build.gradle',
    `-Pconfiguration=${quot}^compile$${quot}`,
    '', // this is a harmless artifact of argument transformation
  ]);
});

test('extractJsonFromScriptOutput', async (t) => {
  const result = testableMethods.extractJsonFromScriptOutput(`Mr Gradle says hello
la dee da, la dee da
JSONDEPS {"hello": "world"}
some other noise`);
  t.deepEqual(result as any, { hello: 'world' });
});

test('extractJsonFromScriptOutput throws on no JSONDEPS', async (t) => {
  const output = 'something else entirely';
  try {
    testableMethods.extractJsonFromScriptOutput(output);
    t.fail('Error expected');
  } catch (e) {
    t.match(
      e.message,
      'No line prefixed with "JSONDEPS " was returned',
      'expected error message',
    );
    t.match(e.message, output, 'error message contains output');
  }
});

test('extractJsonFromScriptOutput throws on multiple JSONDEPS', async (t) => {
  const output = 'JSONDEPS {"hello": "world"}\nJSONDEPS ["one more thing"]';
  try {
    testableMethods.extractJsonFromScriptOutput(output);
    t.fail('Error expected');
  } catch (e) {
    t.match(
      e.message,
      'More than one line with "JSONDEPS " prefix was returned',
      'expected error message',
    );
    t.match(e.message, output, 'error message contains output');
  }
});

test('getGradleAttributesPretty returns undefined when throws', async (t) => {
  const result = testableMethods.getGradleAttributesPretty(``);
  t.deepEqual(result, undefined);
});

test('getGradleAttributesPretty returns attributes on success', async (t) => {
  const result = testableMethods.getGradleAttributesPretty(
    `SNYKECHO snykResolvedDepsJson task is executing via doLast
    JSONATTRS {"org.gradle.usage":["java-runtime","java-api"],"org.gradle.category":["library"],"org.gradle.libraryelements":["jar"],"org.gradle.dependency.bundling":["external"]}
    SNYKECHO processing project: subproj`,
  );
  t.deepEqual(
    result,
    `              org.gradle.usage: java-runtime, java-api
           org.gradle.category: library
    org.gradle.libraryelements: jar
org.gradle.dependency.bundling: external`,
  );
});
test('check build args (plain console output)', async (t) => {
  const result = testableMethods.buildArgs('.', null, '/tmp/init.gradle', {});
  t.deepEqual(result, [
    'snykResolvedDepsJson',
    '-q',
    '--no-daemon',
    '-Dorg.gradle.parallel=',
    '-Dorg.gradle.console=plain',
    '-PonlySubProject=.',
    '-I /tmp/init.gradle',
  ]);
});
