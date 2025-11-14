import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FilterCommentDto } from './dto/filter-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';

@Controller('comments')
@ApiBearerAuth('bearer')
@ApiTags('Comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Create a new comment',
    description: 'Create a new comment for a course or lesson. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      example: {
        message: 'Comment created successfully',
        id: 'uuid',
        content: 'Great course!',
        userId: 'uuid',
        courseId: 'uuid',
        lessonId: 'uuid',
        parentId: null,
        likes: 0,
        dislikes: 0,
        createdAt: '2025-11-14T10:00:00.000Z',
        updatedAt: '2025-11-14T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  async create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: User) {
    const comment = await this.commentsService.create(createCommentDto, user.id);
    return {
      message: 'Comment created successfully',
      ...comment,
    };
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all comments',
    description:
      'Retrieve a paginated list of comments with optional filters (courseId, lessonId, parentId)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      example: {
        message: 'Comments retrieved successfully',
        data: [
          {
            id: 'uuid',
            content: 'Great course!',
            userId: 'uuid',
            courseId: 'uuid',
            lessonId: null,
            parentId: null,
            likes: 5,
            dislikes: 0,
            createdAt: '2025-11-14T10:00:00.000Z',
            updatedAt: '2025-11-14T10:00:00.000Z',
            user: {
              id: 'uuid',
              name: 'John Doe',
              avatar: 'url',
            },
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid filter parameters' })
  async findAll(@Query() filterDto: FilterCommentDto) {
    const comments = await this.commentsService.findAll(filterDto);
    return {
      message: 'Comments retrieved successfully',
      ...comments,
    };
  }

  @Get(':commentId')
  @Public()
  @ApiOperation({
    summary: 'Get a comment by ID',
    description:
      'Retrieve detailed information about a specific comment including user details and replies',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    schema: {
      example: {
        message: 'Comment retrieved successfully',
        id: 'uuid',
        content: 'Great course!',
        userId: 'uuid',
        courseId: 'uuid',
        lessonId: null,
        parentId: null,
        likes: 5,
        dislikes: 0,
        createdAt: '2025-11-14T10:00:00.000Z',
        updatedAt: '2025-11-14T10:00:00.000Z',
        user: {
          id: 'uuid',
          name: 'John Doe',
          avatar: 'url',
        },
        replies: [],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('commentId') commentId: string) {
    const comment = await this.commentsService.findOne(commentId);
    return {
      message: 'Comment retrieved successfully',
      ...comment,
    };
  }

  @Put(':commentId')
  @ApiOperation({
    summary: 'Update a comment',
    description:
      'Update the content of an existing comment. Only the comment owner can update it. Requires authentication.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to update',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    schema: {
      example: {
        message: 'Comment updated successfully',
        id: 'uuid',
        content: 'Updated comment content',
        userId: 'uuid',
        courseId: 'uuid',
        lessonId: null,
        parentId: null,
        likes: 5,
        dislikes: 0,
        createdAt: '2025-11-14T10:00:00.000Z',
        updatedAt: '2025-11-14T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the comment owner' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.update(commentId, updateCommentDto, user.id);
    return {
      message: 'Comment updated successfully',
      ...comment,
    };
  }

  @Patch(':commentId/like')
  @ApiOperation({
    summary: 'Like a comment',
    description: 'Increment the like count for a specific comment. Requires authentication.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to like',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment liked successfully',
    schema: {
      example: {
        message: 'Comment liked successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async like(@Param('commentId') commentId: string) {
    await this.commentsService.like(commentId);
    return {
      message: 'Comment liked successfully',
    };
  }

  @Patch(':commentId/dislike')
  @ApiOperation({
    summary: 'Dislike a comment',
    description: 'Increment the dislike count for a specific comment. Requires authentication.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to dislike',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment disliked successfully',
    schema: {
      example: {
        message: 'Comment disliked successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async dislike(@Param('commentId') commentId: string) {
    await this.commentsService.dislike(commentId);
    return {
      message: 'Comment disliked successfully',
    };
  }
}
