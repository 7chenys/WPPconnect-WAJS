/*!
 * Copyright 2026 WPPConnect Team
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

import * as loader from '../../loader';
import { WPPError } from '../../util/errors';
import type { createGroup } from './createGroup';

export const WAJS_GROUP_CREATE_MODULE_PENDING =
  'WAJS_GROUP_CREATE_MODULE_PENDING';
export const WAJS_GROUP_CREATE_MODULE_SIGNATURE_MISMATCH =
  'WAJS_GROUP_CREATE_MODULE_SIGNATURE_MISMATCH';

export type CreateGroupFunction = (...args: any[]) => any;

export type CreateGroupResolverOptions = {
  findExact: () => unknown;
  findSignatureCandidate: () => unknown;
  retryLimit?: number;
  retryDelayMs?: number;
  wait?: (delayMs: number) => Promise<void>;
};

const DEFAULT_RETRY_LIMIT = 3;
const DEFAULT_RETRY_DELAY_MS = 750;

const isCreateGroupModule = (m: any): boolean =>
  typeof m?.createGroup === 'function' && Boolean(m.GroupAlreadyExistsError);
const isCreateGroupSignatureCandidate = (m: any): boolean =>
  typeof m?.createGroup === 'function';

const waitForRetry = (delayMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

/**
 * Resolve the internal WhatsApp createGroup function before group creation.
 *
 * WhatsApp can register the matching Meta module after WPP.group.create has
 * already become public. Retrying only this lookup avoids replaying a native
 * group creation request while still allowing a delayed registration to settle.
 */
export async function resolveCreateGroupFunction({
  findExact,
  findSignatureCandidate,
  retryLimit = DEFAULT_RETRY_LIMIT,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  wait = waitForRetry,
}: CreateGroupResolverOptions): Promise<CreateGroupFunction> {
  const normalizedRetryLimit = Math.max(0, Math.floor(retryLimit));
  let sawSignatureCandidate = false;

  for (let retryIndex = 0; retryIndex <= normalizedRetryLimit; retryIndex++) {
    const createGroup = findExact();
    if (typeof createGroup === 'function') {
      return createGroup as CreateGroupFunction;
    }

    if (typeof findSignatureCandidate() === 'function') {
      sawSignatureCandidate = true;
    }

    if (retryIndex < normalizedRetryLimit) {
      await wait(retryDelayMs);
    }
  }

  const attempts = normalizedRetryLimit + 1;
  throw new WPPError(
    sawSignatureCandidate
      ? WAJS_GROUP_CREATE_MODULE_SIGNATURE_MISMATCH
      : WAJS_GROUP_CREATE_MODULE_PENDING,
    sawSignatureCandidate
      ? 'The WhatsApp createGroup module signature is incompatible'
      : 'The WhatsApp createGroup module is still pending registration',
    {
      attempts,
      retryLimit: normalizedRetryLimit,
      retryDelayMs,
    }
  );
}

/**
 * Resolve the actual function used by sendCreateGroup. Each lookup creates a
 * fresh scan so a previous negative cache entry cannot suppress a lookup when
 * Meta mutates a module without changing the module count.
 */
export function resolveCreateGroupForSend(): Promise<typeof createGroup> {
  const findCreateGroup = (condition: (m: any) => boolean) => {
    const moduleId = loader.searchId(condition, false, undefined, {
      forceFresh: true,
    });
    return moduleId ? loader.loadModule<any>(moduleId).createGroup : undefined;
  };

  return resolveCreateGroupFunction({
    findExact: () => findCreateGroup(isCreateGroupModule),
    findSignatureCandidate: () =>
      findCreateGroup(isCreateGroupSignatureCandidate),
  }) as Promise<typeof createGroup>;
}
