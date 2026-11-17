"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import PostCard from "../blogs/_components/postcard";
import ButtonIcon from "@/ui/buttonicon";

function scrollToCard(viewport, card) {
  if (!viewport || !card) return;
  const distance = card.getBoundingClientRect().right - viewport.getBoundingClientRect().right;
  viewport.scrollBy({ left: distance, behavior: "smooth" });
}

export default function CoursesCarousel({ posts }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  function selectIndex(index) {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }

  function updateActiveIndex() {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const viewportStart = viewport.getBoundingClientRect().right;
    const cards = [...track.children];
    const nextIndex = cards.reduce((closestIndex, card, index) => {
      const distance = Math.abs(viewportStart - card.getBoundingClientRect().right);
      const closestDistance = Math.abs(
        viewportStart - cards[closestIndex].getBoundingClientRect().right,
      );
      return distance < closestDistance ? index : closestIndex;
    }, 0);

    selectIndex(nextIndex);
  }

  function goTo(index) {
    const card = trackRef.current?.children[index];
    const viewport = viewportRef.current;
    if (!card || !viewport) return;

    scrollToCard(viewport, card);
    selectIndex(index);
  }

  function moveBy(direction) {
    goTo(Math.max(0, Math.min(posts.length - 1, activeIndex + direction)));
  }

  useEffect(() => {
    if (isFocused || posts.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % posts.length;
      const card = trackRef.current?.children[nextIndex];
      const viewport = viewportRef.current;
      if (!card || !viewport) return;

      scrollToCard(viewport, card);
      selectIndex(nextIndex);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isFocused, posts.length]);

  function startDrag(event) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const viewport = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      moved: false,
      captured: false,
    };
  }

  function drag(event) {
    const dragState = dragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const delta = event.clientX - dragState.startX;
    if (Math.abs(delta) > 5 && !dragState.moved) {
      dragState.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragState.captured = true;
    }
    if (dragState.moved) {
      const isRtl = window.getComputedStyle(event.currentTarget).direction === "rtl";
      event.currentTarget.scrollLeft = dragState.startScrollLeft + (isRtl ? delta : -delta);
    }
  }

  function endDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // Keep the drag result through the synthetic click that follows pointerup.
    // Clear it on the next task so ordinary clicks still follow their links.
    window.setTimeout(() => { dragRef.current = null; }, 0);
  }

  return (
    <div
      className="courses-carousel"
      role="region"
      aria-label="تازه‌ترین نوشته‌ها"
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
    >
      <div
        ref={viewportRef}
        className="courses-carousel-viewport"
        dir="rtl"
        onScroll={updateActiveIndex}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          if (dragRef.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <ul className="courses-carousel-track" dir="rtl" ref={trackRef}>
          {posts.map((post) => (
            <PostCard key={post._id} {...post} homeCard showBrief={false} showInteractions />
          ))}
        </ul>
      </div>

      <div className="courses-carousel-controls">
        <ButtonIcon
          aria-label="نوشته قبلی"
          className="courses-carousel-arrow"
          variant="outline"
          disabled={activeIndex === 0}
          onClick={() => moveBy(-1)}
        >
          <ArrowRightIcon aria-hidden="true" />
        </ButtonIcon>
        <div className="courses-carousel-dots" aria-label="انتخاب نوشته">
          {posts.map((post, index) => (
            <button
              aria-label={`رفتن به نوشته ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`courses-carousel-dot${activeIndex === index ? " is-active" : ""}`}
              key={post._id}
              onClick={() => goTo(index)}
              type="button"
            />
          ))}
        </div>
        <ButtonIcon
          aria-label="نوشته بعدی"
          className="courses-carousel-arrow"
          variant="outline"
          disabled={activeIndex === posts.length - 1}
          onClick={() => moveBy(1)}
        >
          <ArrowLeftIcon aria-hidden="true" />
        </ButtonIcon>
      </div>
    </div>
  );
}
