/*!
 * Copyright 2022 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import assert from 'node:assert/strict';

import {
  resolveCreateGroupFunction,
  WAJS_GROUP_CREATE_MODULE_PENDING,
  WAJS_GROUP_CREATE_MODULE_SIGNATURE_MISMATCH,
} from '../src/whatsapp/functions/createGroupResolver';

async function testDelayedModuleResolution(): Promise<void> {
  let searches = 0;
  let waits = 0;
  let nativeCalls = 0;
  const nativeCreateGroup = () => {
    nativeCalls += 1;
  };

  const resolved = await resolveCreateGroupFunction({
    findExact: () => {
      searches += 1;
      return searches === 1 ? undefined : nativeCreateGroup;
    },
    findSignatureCandidate: () => undefined,
    wait: async () => {
      waits += 1;
    },
    retryLimit: 3,
    retryDelayMs: 750,
  });

  assert.equal(resolved, nativeCreateGroup);
  assert.equal(
    searches,
    2,
    'must search again even when the module count is unchanged'
  );
  assert.equal(
    waits,
    1,
    'must wait once before the delayed module becomes available'
  );
  assert.equal(
    nativeCalls,
    0,
    'resolving the internal function must not create a group'
  );
}

async function testPendingModuleResolution(): Promise<void> {
  let waits = 0;

  await assert.rejects(
    () =>
      resolveCreateGroupFunction({
        findExact: () => undefined,
        findSignatureCandidate: () => undefined,
        wait: async () => {
          waits += 1;
        },
        retryLimit: 2,
        retryDelayMs: 750,
      }),
    (error: any) =>
      error?.code === WAJS_GROUP_CREATE_MODULE_PENDING &&
      error?.attempts === 3 &&
      error?.retryLimit === 2
  );

  assert.equal(waits, 2);
}

async function testSignatureMismatch(): Promise<void> {
  await assert.rejects(
    () =>
      resolveCreateGroupFunction({
        findExact: () => undefined,
        findSignatureCandidate: () => () => undefined,
        wait: async () => undefined,
        retryLimit: 1,
        retryDelayMs: 750,
      }),
    (error: any) =>
      error?.code === WAJS_GROUP_CREATE_MODULE_SIGNATURE_MISMATCH &&
      error?.attempts === 2
  );
}

async function main(): Promise<void> {
  await testDelayedModuleResolution();
  await testPendingModuleResolution();
  await testSignatureMismatch();
}

void main();
