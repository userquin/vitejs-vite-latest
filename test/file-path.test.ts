import { describe, expect, it, vi } from 'vitest';
import { dirname, resolve } from 'pathe';
import { fileURLToPath, pathToFileURL } from 'url'

const isWindows = process.platform === 'win32';

function slash(str: string) {
  return str.replace(/\\/g, '/');
}

function toFilePath(id: string, root: string): string {
  let absolute = slash(id).startsWith('/@fs/')
    ? id.slice(4)
    : id.startsWith(dirname(root)) && dirname(root) !== '/'
    ? id
    : id.startsWith('/')
    ? slash(resolve(root, id.slice(1)))
    : id;

  if (absolute.startsWith('//')) absolute = absolute.slice(1);

  // disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
  return isWindows && absolute.startsWith('/')
    ? fileURLToPath(pathToFileURL(absolute.slice(1)).href)
    : absolute;
}

describe('toFilePath', () => {
  // the following tests will work incorrectly on unix systems
  if (isWindows) {
    it('windows', () => {
      const root = 'C:/path/to/project';
      const id = '/node_modules/pkg/file.js';
      const expected = 'C:/path/to/project/node_modules/pkg/file.js';

      const processSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
      const filePath = toFilePath(id, root);
      processSpy.mockRestore();

      expect(slash(filePath)).toEqual(expected);
    });

    it('windows with /@fs/', () => {
      const root = 'C:/path/to/project';
      const id = '/@fs/C:/path/to/project/node_modules/pkg/file.js';
      const expected = 'C:/path/to/project/node_modules/pkg/file.js';

      const processSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
      const filePath = toFilePath(id, root);
      processSpy.mockRestore();

      expect(slash(filePath)).toEqual(expected);
    });
  }

  // the following tests will work incorrectly on windows systems
  if (!isWindows) {
    it('unix', () => {
      const root = '/path/to/project';
      const id = '/node_modules/pkg/file.js';
      const expected = '/path/to/project/node_modules/pkg/file.js';

      const processSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
      const filePath = toFilePath(id, root);
      processSpy.mockRestore();

      expect(slash(filePath)).toEqual(expected);
    });

    it('unix with /@fs/', () => {
      const root = '/path/to/project';
      const id = '/@fs//path/to/project/node_modules/pkg/file.js';
      const expected = '/path/to/project/node_modules/pkg/file.js';

      const processSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
      const filePath = toFilePath(id, root);
      processSpy.mockRestore();
      expect(slash(filePath)).toEqual(expected);
    });

    it('unix in first level catalog', () => {
      const root = '/root';
      const id = '/node_modules/pkg/file.js';
      const expected = '/root/node_modules/pkg/file.js';

      const processSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
      const filePath = toFilePath(id, root);
      processSpy.mockRestore();

      expect(slash(filePath)).toEqual(expected);
    });

    it('unix with /@fs/ in first level catalog', () => {
      const root = '/root';
      const id = '/@fs//root/node_modules/pkg/file.js';
      const expected = '/root/node_modules/pkg/file.js';

      const processSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
      const filePath = toFilePath(id, root);
      processSpy.mockRestore();

      expect(slash(filePath)).toEqual(expected);
    });
  }
});
