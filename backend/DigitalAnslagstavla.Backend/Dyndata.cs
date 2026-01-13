using System;
using System.Collections.Generic;
using System.Linq;

namespace Dyndata
{
  // Obj används överallt i RestRoutes
  public class Obj : Dictionary<string, object?>
  {
    public Obj() : base(StringComparer.OrdinalIgnoreCase) { }

    public bool HasKey(string key) => ContainsKey(key);

    public IEnumerable<string> GetKeys() => Keys;
  }

  // Arr används överallt i RestRoutes
  public class Arr : List<object?>
  {
    public Arr() { }
    public Arr(IEnumerable<object?> items) : base(items) { }

    public int Length => Count;

    public Arr Push(object? item)
    {
      Add(item);
      return this;
    }

    // Slice: end är EXCLUSIVE
    public IEnumerable<object?> Slice(int start, int endExclusive)
    {
      if (start < 0) start = 0;
      if (endExclusive < 0) endExclusive = 0;
      if (start > Count) start = Count;
      if (endExclusive > Count) endExclusive = Count;
      if (endExclusive < start) endExclusive = start;

      return this.Skip(start).Take(endExclusive - start);
    }

    public Arr Filter(Func<object?, bool> predicate)
    {
      return new Arr(this.Where(predicate));
    }
  }

  // Backward-compat om du råkat använda lowercase "obj"
  public class obj : Obj { }

  public static class Factory
  {
    public static Obj Obj() => new Obj();
    public static Obj Obj(params (string key, object? value)[] props)
    {
      var o = new Obj();
      foreach (var (k, v) in props)
        o[k] = v;
      return o;
    }

    public static Arr Arr() => new Arr();
    public static Arr Arr(params object?[] items) => new Arr(items);

    // Backward-compat
    public static obj obj() => new obj();
    public static obj obj(params (string key, object? value)[] props)
    {
      var o = new obj();
      foreach (var (k, v) in props)
        o[k] = v;
      return o;
    }
    public static Arr arr() => new Arr();
    public static Arr arr(params object?[] items) => new Arr(items);
  }
}
