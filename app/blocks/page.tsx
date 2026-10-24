import { CommandBlockScene } from "@/components/blocks/CommandBlockScene";
import { parseLayout } from "@/lib/blocks/parseLayout";

export const metadata = {
  title: "命令方块排布图 · MCBECD",
  description: "用一套字符网格画出命令方块的摆法：类型、条件、朝向、空气",
};

/** 每个示例同时给出源码与渲染结果，页面本身就是这套语法的测试用例。 */
function Example({ code, note }: { code: string; note?: string }) {
  const blocks = parseLayout(code);
  return (
    <figure className="my-6">
      <pre className="overflow-x-auto rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-[13px] leading-6">
        <code>{code}</code>
      </pre>
      <div className="mt-1 rounded-[var(--radius)] border border-[var(--color-border)]">
        <CommandBlockScene blocks={blocks} cube={54} />
      </div>
      {note && (
        <figcaption className="mt-2 text-[13px] text-[var(--color-text-tertiary)]">
          {note}
        </figcaption>
      )}
    </figure>
  );
}

export default function BlocksPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-[var(--content-gutter)] py-16 text-[15px] leading-relaxed">
      <h1 className="text-3xl font-extrabold tracking-tight">命令方块排布图</h1>

      <p>
        讲一条链怎么摆，写字最费劲：「指令 1 在箭头起点，2 到 9 依次指向它，注意 25 是条件连锁」——
        读者得在脑子里把九个方块摆一遍，还容易摆错。截图能看懂，但改一个方块就得重新截。
      </p>

      <p>
        这套东西换一种写法：<strong>像在游戏里摆方块一样，一行一行写出来</strong>。
        一个字符代表一个方块，写完直接渲染成立体图，改一个字就能重画。
      </p>

      <h2 className="mt-10 text-xl font-bold">一分钟上手</h2>

      <p>三个方块的链，重复方块起头，后面两个连锁：</p>

      <Example
        code={"R>  C>  C>"}
        note="R 是重复方块，C 是连锁方块，> 表示箭头朝东。整个场景可以拖动转视角。"
      />

      <h2 className="mt-10 text-xl font-bold">符号表</h2>

      <table>
        <thead>
          <tr>
            <th>符号</th>
            <th>方块</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>I</code></td><td>脉冲方块</td><td>橙色，每次通电执行一次</td></tr>
          <tr><td><code>C</code></td><td>连锁方块</td><td>青色，被前一个方块触发</td></tr>
          <tr><td><code>R</code></td><td>重复方块</td><td>紫色，每游戏刻执行</td></tr>
          <tr><td><code>i</code> <code>c</code> <code>r</code></td><td>同上，有条件</td><td>小写表示「有条件」，正面纹理会缺一个角</td></tr>
          <tr><td><code>.</code> <code>_</code></td><td>空气</td><td>虚线格子，用来占位对齐</td></tr>
        </tbody>
      </table>

      <p>六种状态一起看：</p>

      <Example
        code={"I  i  C  c  R  r"}
        note="从左到右：脉冲、脉冲（有条件）、连锁、连锁（有条件）、重复、重复（有条件）。"
      />

      <h2 className="mt-10 text-xl font-bold">朝向</h2>

      <p>
        方块符号后面紧跟一个方向符，就是箭头朝哪边。不写默认朝东。
      </p>

      <table>
        <thead>
          <tr>
            <th>符号</th>
            <th>朝向</th>
            <th>对应的 facing_direction</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>&gt;</code></td><td>东</td><td>5</td></tr>
          <tr><td><code>v</code></td><td>南</td><td>3</td></tr>
          <tr><td><code>&lt;</code></td><td>西</td><td>4</td></tr>
          <tr><td><code>^</code></td><td>北</td><td>2</td></tr>
        </tbody>
      </table>

      <Example
        code={"R>  C>  C>\n.   .   Cv\n.   .   C<"}
        note="第二行那个 Cv 朝南，第三行的 C< 朝西 —— 折线摆放时，方向得跟着拐。"
      />

      <h2 className="mt-10 text-xl font-bold">排列规则</h2>

      <p>
        一行就是一条 z 轴上的线：<strong>第一行是 z=0，往下递增</strong>；
        <strong>第一列是 x=0，往右递增</strong>。每个 token 之间必须有空格。
      </p>

      <Example
        code={"I>  C>  C>\n.   .   C>\n.   .   Cv"}
        note="空出来的位置用 . 占着，这样第三个方块的 x 坐标才不会跑偏。"
      />

      <h2 className="mt-10 text-xl font-bold">一个真实的例子</h2>

      <p>雪球菜单第一组的九个方块，用这套写法是这样：</p>

      <Example
        code={"R>  C>  C>  C>  C>  C>  C>  C>  C>"}
        note="指令 1 起头，2 到 9 依次接在后面。实际文档里还会在下面标出每条指令干什么。"
      />

      <h2 className="mt-10 text-xl font-bold">常见错误</h2>

      <ul>
        <li>
          <strong>连写没空格</strong>：<code>R&gt;C&gt;</code> 会被当成一个 token，解析器直接报错。
          写成 <code>R&gt;  C&gt;</code>。
        </li>
        <li>
          <strong>方向符写反</strong>：<code>&gt;</code> 是东、<code>&lt;</code> 是西，
          和数学符号一致；<code>^</code> 是北、<code>v</code> 是南，和屏幕上下一致。
        </li>
        <li>
          <strong>忘了占位</strong>：第二行少写一个 <code>.</code>，后面的方块整体左移一格。
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-bold">目前的限制</h2>

      <ul>
        <li>只支持单层（y=0）。叠层的场景暂时得直接传 <code>blocks</code> 数组。</li>
        <li>还没有接进 Markdown。现在只能在代码里调用，接入之后文档正文可以直接写。</li>
        <li>没有箭头连线。链的方向靠方块自身的箭头纹理表达，长链看起来会有点密。</li>
      </ul>

      <p className="text-[13px] text-[var(--color-text-tertiary)]">
        方块纹理取自 Mojang 官方资源包示例（github.com/Mojang/bedrock-samples），
        原始文件是 16×64 的四帧动画条，已裁成 16×16 单帧。
      </p>
    </article>
  );
}
